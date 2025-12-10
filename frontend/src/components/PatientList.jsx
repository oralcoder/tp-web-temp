import { useState, useRef } from 'react';
import DicomViewer from './DicomViewer';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDicomViewer, setShowDicomViewer] = useState(false);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    gender: 'all', // 'all', '여성', '남성'
    registrationDate: 'all', // 'all', 'today', 'week', 'month'
  });

  // 샘플 데이터
  const allPatients = [
    {
      id: 1,
      patientId: 'PT-20251028-01058',
      chartNumber: '20251028-1',
      patientName: '박명가',
      name: '박명가',
      birthDate: '1986-05-22',
      gender: '여성',
      phone: '010-9477-1155',
      registeredAt: '2025-10-28 19:19:43',
      registrationDate: '2025-10-28 19:19:43',
    },
    {
      id: 2,
      patientId: 'PT-20251028-01060',
      chartNumber: 'C-2402',
      patientName: '이지은',
      name: '이지은',
      birthDate: '1992-08-02',
      gender: '여성',
      phone: '',
      registeredAt: '2025-10-28 19:21:29',
      registrationDate: '2025-10-28 19:21:29',
    },
    {
      id: 3,
      patientId: 'PT-20251028-01064',
      chartNumber: 'C-2406',
      patientName: '한명가',
      name: '한명가',
      birthDate: '1990-11-13',
      gender: '여성',
      phone: '',
      registeredAt: '2025-10-28 19:24:09',
      registrationDate: '2025-10-28 19:24:09',
    },
    {
      id: 4,
      patientId: 'PT-20251028-01066',
      chartNumber: 'C-2410',
      patientName: '윤평가',
      name: '윤평가',
      birthDate: '1995-07-07',
      gender: '여성',
      phone: '010-7821-9012',
      registeredAt: '2025-10-28 19:25:41',
      registrationDate: '2025-10-28 19:25:41',
    },
    {
      id: 5,
      patientId: 'PT-20251030-01068',
      chartNumber: '',
      patientName: '홍길자',
      name: '홍길자',
      birthDate: '2025-10-29',
      gender: '여성',
      phone: '',
      registeredAt: '2025-10-30 01:27:15',
      registrationDate: '2025-10-30 01:27:15',
    },
  ];

  // 날짜 필터 헬퍼 함수
  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const isDateInRange = (dateString, range) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return date >= today && date <= todayEnd;
      case 'week':
        const weekAgo = getDateDaysAgo(7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = getDateDaysAgo(30);
        return date >= monthAgo;
      default:
        return true;
    }
  };

  // 검색 및 필터링
  const filteredPatients = allPatients.filter(patient => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        patient.patientId.toLowerCase().includes(query) ||
        patient.chartNumber.toLowerCase().includes(query) ||
        patient.name.toLowerCase().includes(query) ||
        patient.birthDate.includes(query) ||
        patient.gender.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        patient.registeredAt.includes(query)
      );
      if (!matchesSearch) return false;
    }

    // 성별 필터
    if (filters.gender !== 'all' && patient.gender !== filters.gender) {
      return false;
    }

    // 등록일 필터
    if (filters.registrationDate !== 'all' && !isDateInRange(patient.registeredAt, filters.registrationDate)) {
      return false;
    }

    return true;
  });

  const totalItems = filteredPatients.length;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setCurrentPage(1);
    // 검색창에 포커스
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
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const clearAllFilters = () => {
    setFilters({
      gender: 'all',
      registrationDate: 'all',
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.gender !== 'all') count++;
    if (filters.registrationDate !== 'all') count++;
    return count;
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8">환자 정보</h1>

        {/* 검색 및 액션 바 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 검색창 + 필터 */}
            <div className="flex items-center gap-3 flex-1">
              {/* 검색창 */}
              <div className="relative flex items-center w-80">
                {/* 돋보기 아이콘 */}
                <div className="absolute left-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* 검색 입력창 */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검색어를 입력하세요"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* X 버튼 (검색어가 있을 때만 표시) */}
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

              {/* 등록일 필터 */}
              <select
                value={filters.registrationDate}
                onChange={(e) => handleFilterChange('registrationDate', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">등록일: 전체</option>
                <option value="today">등록일: 오늘</option>
                <option value="week">등록일: 최근 7일</option>
                <option value="month">등록일: 최근 30일</option>
              </select>

              {/* 성별 필터 */}
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">성별: 전체</option>
                <option value="여성">성별: 여성</option>
                <option value="남성">성별: 남성</option>
              </select>

              {/* 필터 초기화 버튼 */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  초기화
                </button>
              )}
            </div>

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
                <th className="px-4 py-3 text-center text-sm font-medium">환자번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">차트번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">환자명</th>
                <th className="px-4 py-3 text-center text-sm font-medium">생년월일</th>
                <th className="px-4 py-3 text-center text-sm font-medium">성별</th>
                <th className="px-4 py-3 text-center text-sm font-medium">휴대전화</th>
                <th className="px-4 py-3 text-center text-sm font-medium">등록 일시</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href="#" className="text-blue-600 hover:underline">
                        {patient.patientId}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">{patient.chartNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDicomViewer(true);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        {patient.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">{patient.birthDate}</td>
                    <td className="px-4 py-3 text-center">{patient.gender}</td>
                    <td className="px-4 py-3 text-center">{patient.phone}</td>
                    <td className="px-4 py-3 text-center text-sm">{patient.registeredAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '환자 정보가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 및 페이지네이션 */}
        <div className="mt-6 flex items-center justify-between">
          {/* 왼쪽: 삭제 버튼 */}
          <button className="border-2 border-red-500 text-red-500 px-6 py-2 rounded hover:bg-red-50 transition-colors font-medium">
            삭제
          </button>

          {/* 중앙: 페이지 정보 + 페이지네이션 */}
          <div className="flex items-center gap-6">
            {/* 페이지당 항목 수 선택 */}
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

            {/* 현재 페이지 정보 */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">1-{Math.min(itemsPerPage, totalItems)}</span>
              <span className="mx-1">of</span>
              <span className="font-medium">{totalItems}</span>
            </div>

            {/* 페이지네이션 버튼 */}
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

          {/* 오른쪽: 환자 등록 버튼 */}
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            환자 등록
          </button>
        </div>

        {/* DICOM 뷰어 모달 */}
        {showDicomViewer && selectedPatient && (
          <DicomViewer
            patient={selectedPatient}
            onClose={() => {
              setShowDicomViewer(false);
              setSelectedPatient(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PatientList;
