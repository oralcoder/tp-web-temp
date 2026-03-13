import { useState, useEffect } from 'react';

const SalesStatistics = () => {
  // 모드 선택 (weekly, monthly, custom)
  const [dateMode, setDateMode] = useState('monthly');
  
  // 날짜 상태
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  
  // 필터 상태
  const [activeFilters, setActiveFilters] = useState({
    requestCount: true,
    productionCount: true,
    discardCount: true,
    totalAmount: true,
  });

  // 샘플 데이터
  const sampleData = [
    {
      id: 1,
      division: '차과기공소',
      company: '금오기공소',
      requestCount: 0,
      productionCount: 1,
      discardCount: 0,
      expectedAmount: 100000,
    },
  ];

  // 주차 계산
  const getWeeksInMonth = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const days = lastDay.getDate();
    return Math.ceil(days / 7);
  };

  // 날짜 이동 핸들러
  const handlePrevious = () => {
    if (dateMode === 'monthly') {
      if (selectedMonth === 1) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(12);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else if (dateMode === 'weekly') {
      if (selectedWeek === 1) {
        // 이전 달로
        if (selectedMonth === 1) {
          setSelectedYear(selectedYear - 1);
          setSelectedMonth(12);
          setSelectedWeek(getWeeksInMonth(selectedYear - 1, 12));
        } else {
          setSelectedMonth(selectedMonth - 1);
          setSelectedWeek(getWeeksInMonth(selectedYear, selectedMonth - 1));
        }
      } else {
        setSelectedWeek(selectedWeek - 1);
      }
    }
  };

  const handleNext = () => {
    if (dateMode === 'monthly') {
      if (selectedMonth === 12) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else if (dateMode === 'weekly') {
      const maxWeeks = getWeeksInMonth(selectedYear, selectedMonth);
      if (selectedWeek === maxWeeks) {
        // 다음 달로
        if (selectedMonth === 12) {
          setSelectedYear(selectedYear + 1);
          setSelectedMonth(1);
        } else {
          setSelectedMonth(selectedMonth + 1);
        }
        setSelectedWeek(1);
      } else {
        setSelectedWeek(selectedWeek + 1);
      }
    }
  };

  // 필터 토글
  const toggleFilter = (filterName) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // 합계 계산
  const totals = sampleData.reduce((acc, item) => ({
    requestCount: acc.requestCount + item.requestCount,
    productionCount: acc.productionCount + item.productionCount,
    discardCount: acc.discardCount + item.discardCount,
    expectedAmount: acc.expectedAmount + item.expectedAmount,
  }), { requestCount: 0, productionCount: 0, discardCount: 0, expectedAmount: 0 });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">제작의뢰 및 매출</h1>

        {/* 필터 영역 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* 세그먼트 컨트롤 */}
            <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
              <button
                onClick={() => setDateMode('weekly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  dateMode === 'weekly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setDateMode('monthly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  dateMode === 'monthly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setDateMode('custom')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                  dateMode === 'custom'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                직접입력
              </button>
            </div>

            {/* 날짜 선택 영역 */}
            <div className="flex items-center gap-2">
              {/* 이전 버튼 */}
              {dateMode !== 'custom' && (
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* 날짜 표시 */}
              {dateMode === 'monthly' && (
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white min-w-[180px] text-center">
                  <input
                    type="month"
                    value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setSelectedYear(parseInt(year));
                      setSelectedMonth(parseInt(month));
                    }}
                    className="text-sm font-medium text-gray-900 focus:outline-none w-full text-center cursor-pointer"
                  />
                </div>
              )}

              {dateMode === 'weekly' && (
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setSelectedYear(parseInt(year));
                      setSelectedMonth(parseInt(month));
                      setSelectedWeek(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                  />
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: getWeeksInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>{week}주차</option>
                    ))}
                  </select>
                </div>
              )}

              {dateMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* 다음 버튼 */}
              {dateMode !== 'custom' && (
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 데이터 필터 버튼 */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => toggleFilter('requestCount')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilters.requestCount
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              의뢰건수
            </button>
            <button
              onClick={() => toggleFilter('productionCount')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilters.productionCount
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              제작건수
            </button>
            <button
              onClick={() => toggleFilter('discardCount')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilters.discardCount
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              폐기건수
            </button>
            <button
              onClick={() => toggleFilter('totalAmount')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilters.totalAmount
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              총 비용금액
            </button>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>차트 영역 (차트 라이브러리 연동 필요)</p>
            </div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">구분</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">기업명</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-blue-600">의뢰건수</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-blue-600">제작건수</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-blue-600">폐기건수</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-blue-600">기대금액</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{item.division}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{item.company}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{item.requestCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{item.productionCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{item.discardCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-blue-600 font-medium">
                    {item.expectedAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {/* 합계 행 */}
              <tr className="bg-blue-50 font-semibold">
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-900">합계</td>
                <td className="px-6 py-4 text-center text-sm text-blue-600">{totals.requestCount}</td>
                <td className="px-6 py-4 text-center text-sm text-blue-600">{totals.productionCount}</td>
                <td className="px-6 py-4 text-center text-sm text-blue-600">{totals.discardCount}</td>
                <td className="px-6 py-4 text-center text-sm text-blue-600 font-bold">
                  {totals.expectedAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50" disabled>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50" disabled>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStatistics;
